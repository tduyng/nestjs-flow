## 14. Command Query Responsibility Segregation (CQRS Pattern)


Check the code at branch [14-cqrs](https://gitlab.com/tienduy-nguyen/nestjs-flow/-/tree/14-cqrs)

Check awesome article of Wanago at [Nestjs CQRS](https://wanago.io/2020/12/07/api-nestjs-introduction-cqrs/)

So far, in our application, we’ve been following a pattern of controllers using services to access and modify the data. While it is a very valid approach, there are other possibilities to look into.

NestJS suggests command-query responsibility segregation (CQRS). In this article, we look into this concept and implement it into our application.

Instead of keeping our logic in services, with CQRS, we use commands to update data and queries to read it. Therefore, we have a separation between performing actions and extracting data. While this might not be beneficial for simple CRUD applications, CQRS might make it easier to incorporate a complex business logic.

Doing the above forces us to avoid mixing domain logic and infrastructural operations. Therefore, it works well with Domain-Driven Design.

`Domain-Driven Design is a very broad topic and it will be covered separately`

### Implementing CQRS in NestJs

The very first thing to do is to install a new package. It includes all of the utilities we need in this article.

```ts
$ yarn add @nestjs/cqrs
```

Let’s explore CQRS by creating a new module in our application that we’ve been working on in this series. This time, we add a comments module.

`comment.entity.ts`

```ts
import { Post } from '@modules/post/post.entity';
import { User } from '@modules/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public content: string;

  @ManyToOne(() => Post, (post: Post) => post.comments)
  public post: Post;

  @ManyToOne(() => User, (author: User) => author.posts)
  public author: User;
}

```

...

**Missing docs for this part. Working in progress....**
