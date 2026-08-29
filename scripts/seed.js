require('dotenv').config();
const { sequelize, models } = require('../config/database');

async function seedDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Create default admin
    const [admin] = await models.Admin.findOrCreate({
      where: { email: 'KenzieKenzoe' },
      defaults: {
        name: 'KenzieKenzoe',
        email: 'KenzieKenzoe',
        password: 'koplak99',
        phone: '08123456789',
        role: 'super_admin',
        isActive: true
      }
    });
    console.log('✓ Admin ready:', admin.email, '| role:', admin.role);

    // Create lokasi absen
    const [lokasi] = await models.LokasiAbsen.findOrCreate({
      where: { name: 'Kantor Pusat Jakarta' },
      defaults: {
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
      }
    });
    console.log('✓ Lokasi absen ready:', lokasi.name);

    // Create sample karyawan
    const [karyawan] = await models.Karyawan.findOrCreate({
      where: { email: 'karyawan@pukk.com' },
      defaults: {
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
      }
    });
    console.log('✓ Karyawan ready:', karyawan.name);

    // Create sample nasabah
    const [nasabah] = await models.Nasabah.findOrCreate({
      where: { nik: '3172021234567890' },
      defaults: {
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
      }
    });
    console.log('✓ Nasabah ready:', nasabah.name);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('Admin Email: KenzieKenzoe');
    console.log('Admin Password: koplak99');
    console.log('Karyawan Email: karyawan@pukk.com');
    console.log('Karyawan Password: karyawan123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
