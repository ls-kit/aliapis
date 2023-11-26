import { Controller, Post, Req, Res } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeMethod } from '../../../common/lib/Payment/stripe/Stripe';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { UserRepository } from '../../../common/repository/user/user.repository';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @ApiOperation({ summary: 'webhook' })
  @Post('webhook')
  async create(@Req() req: Request, @Res() res: Response) {
    try {
      const sig = req.headers['stripe-signature'];
      let event: Stripe.Event;
      try {
        // event = StripeMethod.createWebhook(req.body, sig);
        event = StripeMethod.createWebhook(req.rawBody, sig);
      } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`);
        return;
      }

      // const data: any = event.data.object;
      // handle the event
      switch (event.type) {
        case 'customer.created':
          // console.log(JSON.stringify(data));
          break;
        case 'invoice.paid':
          break;

        default:
      }
      return res.sendStatus(200);
    } catch (error) {
      throw error;
    }
  }
}
