import { Request, Response } from 'express';
import Property from '../models/property.model';
import { getRedis } from '../services/redis.service';

const filterable = [
  'id','title','type','price','state','city','areaSqFt','bedrooms','bathrooms','amenities','furnished',
  'availableFrom','listedBy','tags','colorTherm','rating','isVerified','listingType'
];

// Create Property
export const createProperty = async (req: any, res: Response) => {
  try {
    const requiredFields = ['title', 'type', 'price', 'state', 'city', 'areaSqFt', 'bedrooms', 'bathrooms'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ message: 'Missing required fields', fields: missingFields });
    }

    const numericFields = ['price', 'areaSqFt', 'bedrooms', 'bathrooms', 'rating'];
    const invalidNumericFields = numericFields.filter(field =>
      req.body[field] !== undefined && isNaN(Number(req.body[field]))
    );

    if (invalidNumericFields.length > 0) {
      return res.status(400).json({ message: 'Invalid numeric fields', fields: invalidNumericFields });
    }

    const propertyData = {
      ...req.body,
      price: Number(req.body.price),
      areaSqFt: Number(req.body.areaSqFt),
      bedrooms: Number(req.body.bedrooms),
      bathrooms: Number(req.body.bathrooms),
      rating: req.body.rating ? Number(req.body.rating) : 0,
      createdBy: req.user.id,
    };

    const property = await Property.create(propertyData);

    // Invalidate relevant Redis cache
    const redis = getRedis();
    const cacheKeys = await redis.keys('properties:list:*');
    if (cacheKeys.length) {
      await redis.del(...cacheKeys);
      console.log(`Invalidated ${cacheKeys.length} property list cache keys`);
    }

    res.status(201).json(property);
  } catch (err: any) {
    console.error('Create property error:', err);
    res.status(400).json({ message: 'Create property error', error: err.message });
  }
};

// Get multiple properties with filters, pagination, sorting & Redis cache
export const getProperties = async (req: Request, res: Response) => {
  const redis = getRedis();
  const cacheKey = `properties:list:${req.originalUrl}`;
  const cacheTTL = 60; // seconds

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache HIT:', cacheKey);
      return res.json(JSON.parse(cached));
    }
    console.log('Cache MISS:', cacheKey);

    const {
      title,
      type,
      minPrice,
      maxPrice,
      state,
      city,
      minAreaSqFt,
      maxAreaSqFt,
      bedrooms,
      bathrooms,
      amenities,
      furnished,
      availableFrom,
      listedBy,
      tags,
      colorTherm,
      minRating,
      maxRating,
      isVerified,
      listingType,
      sortBy,
      sortOrder = 'asc',
      page = '1',
      limit = '10',
    } = req.query;

    // Build filter
    const filter: any = {};

    if (title) filter.title = { $regex: title as string, $options: 'i' };
    if (type) filter.type = { $regex: type as string, $options: 'i' };
    if (state) filter.state = { $regex: state as string, $options: 'i' };
    if (city) filter.city = { $regex: city as string, $options: 'i' };
    if (amenities) filter.amenities = { $regex: amenities as string, $options: 'i' };
    if (furnished) filter.furnished = furnished;
    if (availableFrom) filter.availableFrom = availableFrom;
    if (listedBy) filter.listedBy = { $regex: listedBy as string, $options: 'i' };
    if (tags) filter.tags = { $regex: tags as string, $options: 'i' };
    if (colorTherm) filter.colorTherm = colorTherm;
    if (listingType) filter.listingType = listingType;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minAreaSqFt || maxAreaSqFt) {
      filter.areaSqFt = {};
      if (minAreaSqFt) filter.areaSqFt.$gte = Number(minAreaSqFt);
      if (maxAreaSqFt) filter.areaSqFt.$lte = Number(maxAreaSqFt);
    }

    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (bathrooms) filter.bathrooms = Number(bathrooms);

    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = Number(minRating);
      if (maxRating) filter.rating.$lte = Number(maxRating);
    }

    if (isVerified !== undefined) {
      filter.isVerified = isVerified === 'true';
    }

    // Sort
    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(filter).sort(sort).skip(skip).limit(limitNum),
      Property.countDocuments(filter),
    ]);

    const result = {
      properties,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    };

    await redis.setex(cacheKey, cacheTTL, JSON.stringify(result));
    console.log(`Cache SET: ${cacheKey} for ${cacheTTL} seconds`);

    res.json(result);
  } catch (err) {
    console.error('Get properties error:', err);
    res.status(500).json({ message: 'Get properties error' });
  }
};

// Get single property by ID with Redis cache
export const getProperty = async (req: Request, res: Response) => {
  const redis = getRedis();
  const cacheKey = `properties:single:${req.params.id}`;
  const cacheTTL = 60; // seconds

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache HIT:', cacheKey);
      return res.json(JSON.parse(cached));
    }
    console.log('Cache MISS:', cacheKey);

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    await redis.setex(cacheKey, cacheTTL, JSON.stringify(property));
    console.log(`Cache SET: ${cacheKey} for ${cacheTTL} seconds`);

    res.json(property);
  } catch (err) {
    console.error('Get property error:', err);
    res.status(500).json({ message: 'Get property error' });
  }
};

// Update property by ID, only by owner
export const updateProperty = async (req: any, res: Response) => {
  const redis = getRedis();
  const propertyId = req.params.id;

  try {
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    Object.assign(property, req.body);
    await property.save();

    // Invalidate caches
    await redis.del(`properties:single:${propertyId}`);
    const keys = await redis.keys('properties:list:*');
    if (keys.length) {
      await redis.del(...keys);
      console.log(`Invalidated ${keys.length} property list cache keys`);
    }

    res.json(property);
  } catch (err: any) {
    console.error('Update property error:', err);
    res.status(400).json({ message: 'Update property error', error: err.message });
  }
};

// Delete property by ID, only by owner
export const deleteProperty = async (req: any, res: Response) => {
  const redis = getRedis();
  const propertyId = req.params.id;

  try {
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    await property.deleteOne();

    // Invalidate caches
    await redis.del(`properties:single:${propertyId}`);
    const keys = await redis.keys('properties:list:*');
    if (keys.length) {
      await redis.del(...keys);
      console.log(`Invalidated ${keys.length} property list cache keys`);
    }

    res.json({ message: 'Property deleted' });
  } catch (err: any) {
    console.error('Delete property error:', err);
    res.status(400).json({ message: 'Delete property error', error: err.message });
  }
};
