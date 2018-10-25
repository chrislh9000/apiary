var mongoose  = require('mongoose');
var connect = process.env.MONGODB_URI;
var Schema = mongoose.Schema;

mongoose.connection.on('error', function() {
  console.log('error connecting to database')
})
mongoose.connection.on('connected', function() {
  console.log('succesfully connected to database')
})

mongoose.connect(connect);

// Build User Schemas
var userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  school: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  skype: {
    type: String,
    required: true,
  },
  gradePointAverage: {
    type: Number,
    required: false,
  },
  academicInterests: [
    {
      type: String,
      required: false,
    }
  ],
  extracurricularInterests: [
    {
      type: String,
      required: false,
    }
  ],
  country: {
    type: String,
    required: true,
  },
  currentGrade: {
    type: String,
    required: false,
  },
  dateJoined: {
    type: Date,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  gender: {
    type: String,
    required: true,
  },
  biography: {
    type: String,
    required: false,
  },
  image: {
    type: Schema.Types.ObjectId,
    ref: 'Image',
    required: false,
  },
  intendedMajor: {
    type: String,
    required: true,
  },
  dreamUni: {
    type: String,
    required: false,
  },
  userType: {
    type: String,
    default: 'user',
    enum: ['admin', 'user', 'client', 'consultant', 'ambassador']
  },
  currentProducts: [
    {
      type: Schema.Types.ObjectId,
      default: [],
      ref: 'Product',
    }
  ],
  orderHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: [],
    }
  ],
  consultant: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  calendarId: {
    type: String,
  },
  upcomingConsultations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
      default: [],
    }
  ],
  pastConsultations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
      default: [],
    }
  ],
  stripeCustomerId: {
    type: String,
  },
  showTour: {
    type: Boolean,
    default: true,
  }
})

//Consultant and Ambassador Schema
const consultantSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  pastConsultations: [
    {
      type: Schema.Types.ObjectId,
      default: [],
      ref: 'Consultation',
    }
  ],
  upcomingConsultations: [
    {
      type: Schema.Types.ObjectId,
      default: [],
      ref: 'Consultation',
    }
  ],
  totalCompensation: {
    type: Number,
    default: 0
  },
  clients: [
    {
      type: Schema.Types.ObjectId,
      default: [],
      ref: 'User'
    }
  ]
})




//Payment Schema: DEFINITELY MODIFY THIS
const stripePaymentSchema = new Schema({
  stripeBrand: String,
  stripeCustomerId: String,
  stripeExpMonth: Number,
  paymentAmount : Number,
  stripeExpYear: Number,
  stripeLast4: Number,
  stripeSource: String,
  status: String,
  user : {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  ambassasdor: {
    type: Schema.Types.ObjectId,
    ref: 'Ambassador'
  },
})

//method gives ambassador 20% of the compensation
stripePaymentSchema.methods.amountforAmbassador = () => {
  return parseInt(this.paymentAmount * 0.8);
}

const paypalPaymentSchema = new Schema ({
  paymentId: String,
  customerEmail: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  price: Number,
  productId: String,
  // product: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'Product',
  //   required: true,
  // },
})

//PRODUCT SCHEMA: Also modify this
var productSchema = new Schema ({
  title : {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price : {
    type: String,
    required: true
  },
  length: {
    type: Number,
    required: true,
  }
})

const consultationSchema = new Schema ({
  client: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  consultant: {
    type: Schema.Types.ObjectId,
    ref: 'Consultant',
    required: true,
  },
  description: {
    type: String,
  },
  duration : {
    type: Number,
    required: true
  },
  eventId : {
    type: String,
    required: false,
  },
  time : {
    type: Date,
    required: false,
  }
})


const oauthTokenSchema = new Schema ({
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  user: {
    type: String,
  }
})
//IMAGE UPLOADING
const imageSchema = new Schema ({
  filename: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
  },
  title: String,
  ambassador: {
    type: Schema.Types.ObjectId,
    ref: 'Ambassador',
    required: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  cloudinaryUrl: {
    type: String,
  },
  cloudinaryThumbnail: String,
})


//Ambassador Schema
const ambassadorSchema = new Schema({
  user : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approved: {
    type: Boolean,
    required: true,
    default: false,
  },
  name: {
    type: String,
    required: true,
  },
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service',
    default: [],
  }],
  stripeVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'Image',
    default: [],
  }],
  links: [{
    type: String,
    default: [],
  }],
  address: String,
  postalCode: String,
  accomplishments: String,
  specialties: String, //potential turn into array later
  additionalInfo: String,
  bioInfo: String,
  city: String,
  stripeAccountId: String,
  categories: [{
    type: String,
    required: false,
  }],
  created: {
    type: Date,
    default: Date.now(),
  },
  setmoreUrl: {
    type: String
  },
})

const serviceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ambassador: {
    type: Schema.Types.ObjectId,
    ref: 'Ambassador',
    required: true,
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: 'general',
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  price: {
    type: Number,
    required: true,
  },
  qualifications: String,
  approved: {
    type: Boolean,
    default: false,
  },
  exampleImages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Image',
      required: false,
    }
  ]
})

//MONGODB MODELS
const User = mongoose.model('User', userSchema);
const Stripe = mongoose.model('StripePayment', stripePaymentSchema);
const PaypalPayment = mongoose.model('PaypalPayment', paypalPaymentSchema);
const Product = mongoose.model('Product', productSchema);
const Consultant = mongoose.model('Consultant', consultantSchema);
const Ambassador = mongoose.model('Ambassador', ambassadorSchema);
const Consultation = mongoose.model('Consultation', consultationSchema);
const OauthToken = mongoose.model('Token', oauthTokenSchema);
const ProfileImage = mongoose.model('Image', imageSchema);
const Service = mongoose.model('Service', serviceSchema);



module.exports = {
  User: User,
  StripePayment: Stripe,
  Product: Product,
  OauthToken: OauthToken,
  Ambassador: Ambassador,
  Consultant: Consultant,
  Consultation: Consultation,
  Image : ProfileImage,
  PaypalPayment: PaypalPayment,
  Service: Service,
}
