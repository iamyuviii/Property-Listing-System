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
      password: hashedPassword
    });
    console.log('Created system user for CSV imports');
  }

  const url = process.env.CSV_URL;
  if (!url) throw new Error('CSV_URL not set');
  console.log('Importing properties from CSV...');
  
  return new Promise<void>((resolve, reject) => {
    const results: any[] = [];
    https.get(url, (res) => {
      res.pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            // Convert fields as needed
            for (const row of results) {
              row.price = Number(row.price);
              row.areaSqFt = Number(row.areaSqFt);
              row.bedrooms = Number(row.bedrooms);
              row.bathrooms = Number(row.bathrooms);
              row.rating = Number(row.rating);
              row.isVerified = row.isVerified === 'TRUE';
              row.createdBy = systemUser._id; // Assign system user as creator
              await Property.create(row);
            }
            console.log('CSV import complete.');
            resolve();
          } catch (err) {
            reject(err);
          }
        })
        .on('error', reject);
    }).on('error', reject);
  });
}; 