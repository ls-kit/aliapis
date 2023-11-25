export default () => ({
  app: {
    name: process.env.APP_NAME,
    key: process.env.APP_KEY,
    url: process.env.APP_URL,
    client_app_url: process.env.CLIENT_APP_URL,
    port: parseInt(process.env.PORT, 10) || 3000,
  },

  fileSystems: {
    public: {},
    s3: {
      driver: 's3',
      key: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_DEFAULT_REGION,
      bucket: process.env.AWS_BUCKET,
      url: process.env.AWS_URL,
      endpoint: process.env.AWS_ENDPOINT,
    },
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT,
  },

  security: {
    salt: 10,
  },

  otapi: {
    instance_key: process.env.OTAPI_INSTANCE_KEY,
  },

  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    user: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM_NAME,
  },

  auth: {
    facebook: {
      app_id: process.env.FACEBOOK_APP_ID,
      app_secret: process.env.FACEBOOK_APP_SECRET,
      callback: process.env.FACEBOOK_CALLBACK_URL,
    },
  },

  payment: {
    stripe: {
      publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
      secret_key: process.env.STRIPE_SECRET_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  },
});
