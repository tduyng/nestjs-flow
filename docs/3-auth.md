## 3. Auth


Check the code at branch [3-auth](https://gitlab.com/tienduy-nguyen/nestjs-flow/-/tree/3-auth)

Create authentication with bcrypt, passport Nestjs, Jwt & cookies

Check [Nest security](https://docs.nestjs.com/security/authentication) for more information.

### User

To use authentication, first of all, wee need to have User table.

- Create UserEntity with Typeorm: `src/modules/user/user.entity.ts`
  ```ts
  //user.entity.ts
  import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

  @Entity()
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;
  }

  ```
- User service: `src/modules/user/user.service.ts`
  With the demo purpose, we don't need to create UserController (to have route update, delete ... for user). In UserService, we just create some simple helper methods to use in AuthService.

  ```ts
  import { RegisterUserDto } from '@modules/auth/dto';
  import { Injectable } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { User } from './user.entity';

  @Injectable()
  export class UserService {
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
    ) {}

    public async getUsers(): Promise<User[]> {
      return await this.userRepository.find();
    }
    public async getUserById(id: string): Promise<User> {
      return await this.userRepository.findOne({ where: { id: id } });
    }
    public async getUserByEmail(email: string): Promise<User> {
      return await this.userRepository.findOne({ where: { email: email } });
    }
    public async create(userDto: RegisterUserDto): Promise<User> {
      const user = this.userRepository.create(userDto);
      await this.userRepository.save(user);
      return user;
    }
  }

  ```
- And update UserModule: `src/modules/user/user.module.ts`
  ```ts
  import { Module } from '@nestjs/common';
  import { TypeOrmModule } from '@nestjs/typeorm';
  import { User } from './user.entity';
  import { UserService } from './user.service';

  @Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserService],
    exports: [UserService],
  })
  export class UserModule {}

  ```
  **Note**: `TypeOrmModule.forFeature([User])` allows to use UserRepository of TypeOrm in all User providers files.

  Don't forget import `UserModule` in `AppModule`

### Auth

The easiest way protect auth with Nest app is using passport & Json web token strategy.
The docs of Nest well explain this part in details. Check [Nest Authentication](https://docs.nestjs.com/security/authentication#authentication)

There are two strategies:
- Passport strategy: We will use passport-local to authenticate when user login
- Json web token strategy: using in all other protected routes

When an user login, it will verify email (or username) & password. If it match, an user logged is assigned in Request. And we will save information of this user in cookie by the json token code. This json web token will be verified in each request in each route that we implements Jwt guards.

Ok, that's is a little bit theory. Now, we will start to code to better understand it.

#### Installation

For this part, we need to install packages:
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js/): For hashing password
- [passport-jwt](https://github.com/mikenicholson/passport-jwt): passport strategy with json web token
- **@nestjs/jwt** & **passport-jwt** to use feature JWT of Nestjs
- [cookie-parser](https://github.com/expressjs/cookie-parser): to parse cookie

  ```bash
  $ yarn add @nestjs/jwt @nestjs/passport passport-jwt cookie-parser bcrypt
  $ yarn add -D @types/bcrypt @types/cookie-parser @types/passport-jwt
  ```
#### Auth service

- Update middleware : ` app.use(cookieParser());` in `main.ts` file.

- Create `auth.service.ts` file in `src/modules/auth`
  ```ts
  // auth.service.ts
  import {
    BadRequestException,
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
  } from '@nestjs/common';
  import * as bcrypt from 'bcrypt';
  import { JwtService } from '@nestjs/jwt';
  import { IPayloadJwt } from './auth.interface';
  import { RegisterUserDto } from './dto';
  import { UserService } from '@modules/user/user.service';

  @Injectable()
  export class AuthService {
    constructor(
      private readonly userService: UserService,
      private readonly jwtService: JwtService,
    ) {}

    public async validateUser(email: string, password: string) {
      const user = await this.userService.getUserByEmail(email);
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return user;
        }
      }
      throw new BadRequestException('Invalids credentials');
    }

    public async register(registerDto: RegisterUserDto) {
      const userCheck = await this.userService.getUserByEmail(registerDto.email);
      if (userCheck) {
        throw new ConflictException(
          `User with email: ${registerDto.email} already exists`,
        );
      }
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(registerDto.password, salt);

      try {
        const user = await this.userService.create({
          ...registerDto,
          password: hashPassword,
        });
        return user;
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    public getCookieWithToken(payload: IPayloadJwt) {
      const token = this.jwtService.sign(payload);
      return `Authorization=${token};HttpOnly;Path=/;Max-Age=${process.env.JWT_EXPIRATION_TIME}`;
    }
    public clearCookie() {
      return `Authorization=;HttpOnly;Path=/;Max-Age=0`;
    }
  }

  ```

  - In AuthService, we inject UserService and JwtService (provide by `@nestjs/jwt`)
  - **register** method: using when an user want to register new account
  - **validateUser** method: Use to verify email & password given by user request. We will use this method in local-password strategy too.
  - **getCookie** methods: using to generate cookies with jwt & clear it when user logged out.
- Create auth strategies
  - Create Passport local strategy
    Create `local.strategy.ts` in `src/modules/auth/strategies`:
    ```ts
    // local.strategy.ts
    import { User } from '@modules/user/user.entity';
    import { Injectable } from '@nestjs/common';
    import { PassportStrategy } from '@nestjs/passport';
    import { Strategy } from 'passport-local';
    import { AuthService } from '../auth.service';

    @Injectable()
    export class LocalStrategy extends PassportStrategy(Strategy) {
      constructor(private _authService: AuthService) {
        super({ usernameField: 'email' });
      }

      public async validate(email: string, password: string): Promise<User> {
        const user = await this._authService.validateUser(email, password);
        return user;
      }
    }

    ```
    This stragety is very simple. We create class `LocalStrategy` extends from `PassportStrategy` of @Nestjs/passport module.

    We use `super({ usernameField: 'email' });`: that means we use the field 'email' to verify account. By default with `super()` is 'username'.

    In this class, we need have an method `validate`. The passport strategy of Nestjs will trigger this method automatically for Passport guard.

    **Note**: don't for get use `@Injectable()` to make this class as a custom providers to import or export in Auth module.

  - Create Jwt strategy: `jwt.strategy.ts`
    ```ts
    // jwt.strategy.ts
    import { IPayloadJwt } from '../auth.interface';
    import { Injectable } from '@nestjs/common';
    import { ExtractJwt, Strategy } from 'passport-jwt';
    import { PassportStrategy } from '@nestjs/passport';
    import { UserService } from '@modules/user/user.service';
    import { Request } from 'express';

    @Injectable()
    export class JwtStrategy extends PassportStrategy(Strategy) {
      constructor(private readonly userService: UserService) {
        super({
          jwtFromRequest: ExtractJwt.fromExtractors([
            (req: Request) => {
              return req?.cookies?.Authorization;
            },
          ]),
          ignoreExpiration: false,
          secretOrKey: process.env.JWT_SECRET,
        });
      }
      public async validate(payload: IPayloadJwt) {
        const user = await this.userService.getUserByEmail(payload.email);
        return user;
      }
    }


    ```

    - Principe of Jwt strategy is the same with local passport strategy. But in the implement `super()` of parent class, we need setup some config for jwt & cookies.
    - `JWT_SECRET`: variable environment setup in **.env** file
    - If you don't want to you extract cookie, just extract with Bearer authentication header:

      ```ts
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: process.env.JWT_SECRET,
      });
      ```
  - Create `guards` files to indicate which guard auth we will use for routing
    - `local-auth.guard.ts`

      ```ts
      // local.strategy.ts
      import { Injectable } from '@nestjs/common';
      import { AuthGuard } from '@nestjs/passport';

      @Injectable()
      export class LocalAuthGuard extends AuthGuard('local') {}
      ```

    - `jwt-auth.guard.ts`

      ```ts
      // jwt.guard.ts
      import { Injectable } from '@nestjs/common';
      import { AuthGuard } from '@nestjs/passport';

      @Injectable()
      export class JwtAuthGuard extends AuthGuard('jwt') {}

      ```

#### Auth controller

Ok, now we will update **auth guard in our routes**
  - Create AuthController: `src/modules/auth/auth.controller.ts`

    ```ts
    // auth.controller
    import { IRequestWithUser } from '@common/interfaces/http.interface';
    import {
      Body,
      Controller,
      Get,
      Post,
      Req,
      Res,
      UseGuards,
    } from '@nestjs/common';
    import { IPayloadJwt } from './auth.interface';
    import { AuthService } from './auth.service';
    import { RegisterUserDto } from './dto';
    import { LocalAuthGuard } from './guards/local-auth.guard';
    import { Response } from 'express';
    import { JwtAuthGuard } from './guards/jwt-auth.guard';
    import { ApiTags } from '@nestjs/swagger';

    @ApiTags('Auth')
    @Controller('auth')
    export class AuthController {
      constructor(private readonly authService: AuthService) {}

      @Post()
      public async register(@Body() registerDto: RegisterUserDto) {
        const user = await this.authService.register(registerDto);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = user;
        return rest;
      }

      @Post('login')
      @UseGuards(LocalAuthGuard)
      public async login(@Req() req: IRequestWithUser, @Res() res: Response) {
        const { user } = req;
        const payload: IPayloadJwt = {
          userId: user.id,
          email: user.email,
        };
        const cookie = this.authService.getCookieWithToken(payload);
        res.setHeader('Set-Cookie', cookie);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = user;
        return res.send(rest);
      }

      @Get()
      @UseGuards(JwtAuthGuard)
      public getAuthenticatedUser(@Req() req: IRequestWithUser) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = req.user;
        return rest;
      }

      @Post('logout')
      @UseGuards(JwtAuthGuard)
      public async logout(@Res() res: Response) {
        res.setHeader('Set-Cookie', this.authService.clearCookie());
        return res.sendStatus(200);
      }
    }

    ```
    - `@UseGuards(LocalAuthGuard)`: for local strategy --> using for login
    - `@UseGuards(JwtAuthGuard)`: for jwt strategy --> using to protect our routes

      When use login, we need to set cookie with new json web token.

- Update also auth Guards in `Postcontroller`

#### Complete authentication part

- Create `auth.module.ts`
  ```ts
  import { Module } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { LocalStrategy } from './strategies/local.strategy';
  import { PassportModule } from '@nestjs/passport';
  import { UserModule } from '@modules/user/user.module';
  import { JwtModule } from '@nestjs/jwt';
  import { JwtStrategy } from './strategies/jwt.strategy';
  import { AuthController } from './auth.controller';
  @Module({
    imports: [
      UserModule,
      PassportModule,
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRE_TIME },
      }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService],
    controllers: [AuthController],
  })
  export class AuthModule {}

  ```
- Import `AuthModule` in `AppModule` and run server to test

  **Note**: To test cookie with postman: If the project works properly, when you logged successfully, a cookie will be created automatically.

  But if you want to use this cookie to test other protected routes, you need to copie that and add it to header with the key: "Cookie" --> value: value of cookie copied

  See the photo to better understand.

  <div align="center">
  <img src="../docs/images/3-cookie.png" alt="Using cookie">
  </div>
