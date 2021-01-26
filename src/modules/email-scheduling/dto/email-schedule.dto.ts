import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class EmailScheduleDto {
  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  html: string;

  @IsDateString()
  date: string;
}

/*
// Model send email with nodemailer
// send mail with defined transport object
let info = await transporter.sendMail({
  from: '"Fred Foo 👻" <foo@example.com>', // sender address
  to: 'bar@example.com, baz@example.com', // list of receivers
  subject: 'Hello ✔', // Subject line
  text: 'Hello world?', // plain text body
  html: '<b>Hello world?</b>', // html body
});
 */
