require('dotenv').config();
const { sequelize, models } = require('../config/database');

async function seedDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Create admin
    const admin = await models.Admin.create({
      name: 'Admin PUKK',
      email: 'admin@pukk.com',
      password: 'admin123456', // akan di-hash otomatis
      phone: '08123456789',
      role: 'super_admin',
      isActive: true
    });
    console.log('✓ Admin created:', admin.email);

    // Create lokasi absen
    const lokasi = await models.LokasiAbsen.create({
      name: 'Kantor Pusat Jakarta',
      latitude: '-6.1751',
      longitude: '106.8650',
      radius: 100,
      address: 'Jl. Sudirman, Jakarta Pusat',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      checkInTime: '08:00',
      checkOutTime: '17:00',
      workingDays: [1, 2, 3, 4, 5]
    });
    console.log('✓ Lokasi absen created:', lokasi.name);

    // Create sample karyawan
    const karyawan = await models.Karyawan.create({
      name: 'John Doe',
      email: 'karyawan@pukk.com',
      password: 'karyawan123456',
      phone: '08987654321',
      nik: '3172051234567890',
      position: 'Sales Officer',
      salary: 5000000,
      bankName: 'BCA',
      bankAccount: '12345678901',
      status: 'active',
      isActive: true
    });
    console.log('✓ Karyawan created:', karyawan.name);

    // Create sample nasabah
    const nasabah = await models.Nasabah.create({
      karyawanId: karyawan.id,
      name: 'Budi Santoso',
      nik: '3172021234567890',
      phone: '08123456789',
      email: 'budi@email.com',
      address: 'Jl. Merdeka 123',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      bankName: 'BNI',
      bankAccount: '0987654321',
      qrisCode: '00020101021126570011ID.DANA.WWW011893600915303453966002090345396600303UMI51440014ID.CO.QRIS.WWW0215ID10265800903420303UMI5204899953033605802ID5904PUKK6015Kota Jakarta Se610512740630462BD',
      occupancy: 'Wiraswasta',
      maritalStatus: 'married',
      monthlyIncome: 2500000,
      status: 'active'
    });
    console.log('✓ Nasabah created:', nasabah.name);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('Admin Email: admin@pukk.com');
    console.log('Admin Password: admin123456');
    console.log('Karyawan Email: karyawan@pukk.com');
    console.log('Karyawan Password: karyawan123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
