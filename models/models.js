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
    required: true
  },
  school: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
  },
  gradePointAverage: {
    type: Number,
    required: false,
  },
  academicInterests: {
    type: String,
    required: false,
  },
  extracurricularInterests: {
    type: String,
    required: false,
  },
  country: {
    type: String
  },
  currentGrade: {
    type: Number,
    required: true
  },
  dateJoined: {
    type: Date,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true
  },
  biography: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  userType: {
    type: String,
    default: 'user',
    enum: ['admin', 'user', 'client', 'consultant']
  },
  currentProducts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }
  ],
  orderHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }
  ],
  consultant: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  calenderUrl: {
    type: String,
  },
  tokens: {
    type: String,
    default: null
  },
  upcomingConsultations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Consultation'
    }
  ],
  pastConsultations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
    }
  ],
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
      ref: 'Consultation',
    }
  ],
  upcomingConsultations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
    }
  ],
  totalCompensation: {
    type: Number,
    default: 0
  },
})

const ambassadorSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  pastConsultations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Consultation'
    }
  ],
  upcomingConsultations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Consultation'
    }
  ],
  totalCompensation: {
    type: Number,
    default: 0
  },
})


//Payment Schema: DEFINITELY MODIFY THIS
var paymentSchema = new Schema({
  stripeBrand: String,
  stripeCustomerId: String,
  stripeExpMonth: Number,
  paymentAmount : Number,
  stripeExpYear: Number,
  stripeLast4: Number,
  stripeSource: String,
  status: String,
  _userid : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
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

var consultationSchema = new Schema ({
  client: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
  },
  duration : {
    type: Number,
    required: true
  },
  sessionNumber: {
    type: Number,
    required: true
  },
  eventId : {
    type: String,
    required: true
  },
})


var oauthTokenSchema = new Schema ({
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
//MONGODB MODELS
const User = mongoose.model('User', userSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Product = mongoose.model('Product', productSchema);
const Consultant = mongoose.model('Consultant', consultantSchema);
const Ambassador = mongoose.model('Ambassador', ambassadorSchema);
const Consultation = mongoose.model('Consultation', consultationSchema);
const OauthToken = mongoose.model('Token', oauthTokenSchema);



module.exports = {
  User: User,
  Payment: Payment,
  Product: Product,
  OauthToken: OauthToken,
  Ambassador: Ambassador,
  Consultant: Consultant,
  Consultation: Consultation,
}
