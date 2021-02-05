import { Injectable } from '@nestjs/common';
import nodemailer, { createTransport, TestAccount } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;
  private _testAccount: TestAccount;
  constructor() {
    this._getTestAccount();
    this.nodemailerTransport = createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this._testAccount?.user || process.env.EMAIL_USER,
        pass: this._testAccount?.pass || process.env.EMAIL_PASSWORD,
      },
    });
  }

  public sendMail(options: Mail.Options) {
    return this.nodemailerTransport.sendMail(options);
  }

  /* Private methods */
  private async _getTestAccount() {
    this._testAccount = await nodemailer.createTestAccount();
  }
}
