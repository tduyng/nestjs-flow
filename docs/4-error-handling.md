## 4. Error handling

Check the code at branch [4-error-handling](https://gitlab.com/tienduy-nguyen/nestjs-flow/-/tree/4-error-handling)

### Exception filter

Nest use built-in exception layer which is responsible for processing all unhandled exceptions across an application.

Check [Nest exception filter](https://docs.nestjs.com/exception-filters) for information details.

- Format of an exception:

  ```ts
  {
    "statusCode": number,
    "message": string
  }

  ```
- Throw standard exception in Nest
  Here is some examples using Exception filter in app:
  ```ts
  const post = await this.postRepository.findOne({ where: { id: id } });
    if (!post) {
      throw new NotFoundException(`Post with id ${post.id} not found`);
    }
  ```

  ```ts
  const user = await this.userService.getUserByEmail(email);
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return user;
      }
    }
    throw new BadRequestException('Invalids credentials');

  ```

  ```ts
  const userCheck = await this.userService.getUserByEmail(registerDto.email);
    if (userCheck) {
      throw new ConflictException(
        `User with email: ${registerDto.email} already exists`,
      );
    }
  ```

  ```ts
  } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  ```
- Create custom exception: Logger exception

  ex: Forbidden.exception.ts
  ```ts
  export class ForbiddenException extends HttpException {
    constructor() {
      super('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  ```
  Check more [Nest exception filter](https://docs.nestjs.com/exception-filters).

### Validation

Nest provides several pipes available right out-of-the-box:

- ValidationPipe
- ParseIntPipe
- ParseBoolPipe
- ParseArrayPipe
- ParseUUIDPipe

The ValidationPipe makes use of the powerful [class-validator](https://github.com/typestack/class-validator) package and its declarative validation decorators.

The ValidationPipe provides a convenient approach to enforce validation rules for all incoming client payloads, where the specific rules are declared with simple annotations in local class/DTO declarations in each module.

We will use auto-validation of Nest:
- Setup in `main.ts`
  ```ts
  // main.ts
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    ...
  }
  bootstrap();
  ```
- Install indispensable package dependency to make it works: 
  - [Class-validator](https://github.com/typestack/class-validator)
  - [Class-transformer](https://github.com/typestack/class-transformer)
  
  ```bash
  $ yarn add class-transformer class-validator
  ```
- Using class-validator
  We will use this package to make sûre that we have good data for body request (DTO) & for entity data before save to database.

  Example using validation in `user.entity.ts`

  ```ts
  // user.entity.ts
  import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
  import { IsDate, IsEmail, Min } from 'class-validator';
  import moment from 'moment';

  @Entity()
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    @IsEmail()
    email: string;

    @Column()
    @Min(0)
    password: string;

    @Column({
      type: Date,
      default: moment(new Date()).format('YYYY-MM-DD HH:ss'),
      nullable: true,
    })
    @IsDate()
    createdAt: Date;

    @Column({
      type: Date,
      default: moment(new Date()).format('YYYY-MM-DD HH:ss'),
      nullable: true,
    })
    @IsDate()
    updatedAt: Date;
  }

  ```
  Example in `create-post.dto.ts`

  ```ts
  import { IsString } from 'class-validator';

  export class CreatePostDto {
    @IsString()
    title: string;

    @IsString()
    content: string;
  }

  ```

Check more [Doc class-validator](https://github.com/typestack/class-validator/blob/develop/docs/basics/validating-objects.md) for advanced validation.
    