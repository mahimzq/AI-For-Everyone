const sequelize = require('./config/db');
const Registration = require('./models/Registration');
async function test() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    const reg = await Registration.findOne({ where: { qr_token: 'test-token' }, attributes: ['id','full_name','status'] });
    console.log('Result:', JSON.stringify(reg));
    process.exit(0);
  } catch(e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
}
test();
