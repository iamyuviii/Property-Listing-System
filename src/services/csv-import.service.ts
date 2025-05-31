import Property from '../models/property.model';
import User from '../models/user.model';
import csv from 'csv-parser';
import https from 'https';
import bcrypt from 'bcryptjs';

export const importCSVIfNeeded = async () => {
  const count = await Property.countDocuments();
  if (count > 0) {
    console.log('Properties already exist, skipping CSV import.');
    return;
  }

  // Create system user if it doesn't exist
  let systemUser = await User.findOne({ email: 'system@hypergro.com' });
  if (!systemUser) {
    const hashedPassword = await bcrypt.hash('system123', 10);
    systemUser = await User.create({
      email: 'system@hypergro.com',
      password: hashedPassword,
    });
    console.log('Created system user for CSV imports');
  }

  const url = process.env.CSV_URL;
  if (!url) throw new Error('CSV_URL not set');
  console.log('Importing properties from CSV...');

  return new Promise<void>((resolve, reject) => {
    const results: any[] = [];
    https
      .get(url, (res) => {
        res
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', async () => {
            try {
              for (const row of results) {
                // 1) Delete any `_id` field (if the CSV had one).
                delete row._id;

                // 2) Also delete any `id` field (Mongoose will map `id`→`_id` by default).
                delete row.id;

                // 3) Convert numeric/boolean fields safely:
                row.price     = Number(row.price)    || 0;
                row.areaSqFt  = Number(row.areaSqFt) || 0;
                row.bedrooms  = Number(row.bedrooms) || 0;
                row.bathrooms = Number(row.bathrooms)|| 0;
                row.rating    = Number(row.rating)   || 0;
                row.isVerified = row.isVerified === 'TRUE';
                row.createdBy = systemUser._id;

                // 4) Insert into MongoDB—Mongoose auto-generates a valid `_id` (ObjectId).
                await Property.create(row);
              }
              console.log('CSV import complete.');
              resolve();
            } catch (err) {
              reject(err);
            }
          })
          .on('error', reject);
      })
      .on('error', reject);
  });
};
