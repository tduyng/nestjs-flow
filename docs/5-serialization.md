## 5. Serialization


Check the code at branch [5-serialization](https://gitlab.com/tienduy-nguyen/nestjs-flow/-/tree/5-serialization)

If you remember, in previous part, when we want to return **user** from request, we need to exclude `password` field with destructuring Javascript method.

But in the real project, we will have many secret field, we will don't do like that. Normally, we can  create data transfer object and create the mapper method from real object to dto object. Then it will return a safe data for client.

The Nest framework make use of powerful of **class-transformer**, it helps us to resolve this problem more simpler. Check out [Nest serialization](https://docs.nestjs.com/techniques/serialization)

Now, we see how to implement Nest serialization:
### Exclude option
- Using `Exclude` in entities
  
  User Entity:
  ```diff
  // user.entity.ts
  import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
  import { IsDate, IsEmail, Min } from 'class-validator';
  import moment from 'moment';
  + import { Exclude } from 'class-transformer';

  @Entity()
  export class User {
    @Column()
    @Min(0)
  +   @Exclude()
    password: string;
  ```
- Using `ClassSerializerInterceptor` in **controller**
  ```ts
  // auth.controller.ts
  @Controller('auth')
  @UseInterceptors(ClassSerializerInterceptor)
  export class AuthController {
  ...  
  }
  ```

  Or we can set global for `ClassSerializerInterceptor`

  ```diff
  // main.ts
  async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }));
  + app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  ...
  }

  ```
### Expose option

- `@SerializeOptions()` 
  By default, all properties of our entities are exposed. We can change this strategy by providing additional options to the **class-transformer**. 
  ```ts
  @Controller('auth')
  @SerializeOptions({
    strategy: 'excludeAll'
  })
  export class AuthenticationController
  ```
  And  `user.entity.ts`
  ```ts
  import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
  import { Expose } from 'class-transformer';
  
  @Entity()
  class User {
    @PrimaryGeneratedColumn('uuid')
    public id?: string;
  
    @Column({ unique: true })
    @Expose()
    public email: string;
  
    @Column()
    @Expose()
    public name: string;
  
    @Column()
    public password: string;
  }
  
  export default User;
  ```

  Example results:
  First result before use option `expose`:
  ```json
  {
    "name": "user1",
    "email": "user1@gmail.com",
    "passport": "£ùdsql!-$fhkqpsdfhosdhfsdhf$+o~qsd*46dfqsdf"
  }
  ```
  ---> Result after expose All:
  ```json
  {
    "name": "user1",
    "email": "user1@gmail.com",
  }
  ```

- Nullable features of **class-transformer**
  The `@SerializeOptions()` matchs the options that you can provide for the `classToPlain` method in the **class-transformer**.

  For example: before you use `@Column({nullable: true})`, but with NestJs & Class-transformer, you can make like you code typescript directly:

  ```ts
  @Entity()
  class Post {
    // ...
  
    @Column({ nullable: true })
    public category?: string;
  }
  ```
  Or if you don't want to return to response when this field null with `@Transform` of `class-transformer`.
  ```ts
  @Column({ nullable: true })
   @Transform((value) => {
    if (value) {
      return value;
    }
  })
  public category?: string;
  ```
  
### Issues with using @Res() decorator

In the previous part, we have used the `@Res()` decorator to access the Express Response object.
- Previous method login in `AuthController`
  ```ts
  // auth.controller.ts
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

  ```
  Using the  `@Res()` decorator strips us from some advantages of using NestJS. Unfortunately, it interferes with the  `ClassSerializerInterceptor`. To prevent that, we can follow [some advice from the creator of NestJS](https://github.com/nestjs/nest/issues/284#issuecomment-348639598). If we use the  request.res object instead of the  `@Res()` decorator, we don’t put NestJS into the express-specific mode.

  Solution:
  ```ts
  // auth.controller.ts
  @Post('login')
  @UseGuards(LocalAuthGuard)
  public async login(@Req() req: IRequestWithUser) {
    const { user } = req;
    const payload: IPayloadJwt = {
      userId: user.id,
      email: user.email,
    };
    const cookie = this.authService.getCookieWithToken(payload);
    req.res.setHeader('Set-Cookie', cookie);
    return user;
  }
  ```
