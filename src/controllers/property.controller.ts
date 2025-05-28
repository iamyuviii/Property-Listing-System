import Property from '../models/property.model';
import { Request, Response } from 'express';
import { pick } from '../utils/helpers';
import { getRedis } from '../services/redis.service';

const filterable = [
  'id','title','type','price','state','city','areaSqFt','bedrooms','bathrooms','amenities','furnished','availableFrom','listedBy','tags','colorTherm','rating','isVerified','listingType'
];

export const createProperty = async (req: any, res: Response) => {
  try {
    const requiredFields = ['title', 'type', 'price', 'state', 'city', 'areaSqFt', 'bedrooms', 'bathrooms'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }

    const numericFields = ['price', 'areaSqFt', 'bedrooms', 'bathrooms', 'rating'];
    const invalidNumericFields = numericFields.filter(field => 
      req.body[field] !== undefined && isNaN(Number(req.body[field]))
    );

    if (invalidNumericFields.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid numeric fields', 
        fields: invalidNumericFields 
      });
    }

    const propertyData = {
      ...req.body,
      price: Number(req.body.price),
      areaSqFt: Number(req.body.areaSqFt),
      bedrooms: Number(req.body.bedrooms),
      bathrooms: Number(req.body.bathrooms),
      rating: req.body.rating ? Number(req.body.rating) : undefined,
      createdBy: req.user.id
    };

    const property = await Property.create(propertyData);

    // Invalidate cache for list views after creating a new property
    const redis = getRedis();
    const cacheKeys = await redis.keys('properties:list:*');
    if (cacheKeys.length > 0) {
      await redis.del(...cacheKeys);
      console.log(`Invalidated ${cacheKeys.length} property list cache keys`);
    }

    res.status(201).json(property);
  } catch (err: any) {
    console.error('Create property error:', err);
    res.status(400).json({ 
      message: 'Create property error', 
      error: err.message 
    });
  }
};

export const getProperties = async (req: Request, res: Response) => {
  const redis = getRedis();
  const cacheKey = `properties:list:${req.originalUrl}`;
  const cacheTTL = 60; //redis Cache for 60 seconds

  try {
    console.log('Checking Redis cache for key:', cacheKey);
    const cachedProperties = await redis.get(cacheKey);
    if (cachedProperties) {
      console.log('Cache HIT: Serving properties from Redis cache');
      return res.json(JSON.parse(cachedProperties));
    }
    console.log('Cache MISS: Properties not found in Redis cache');
 
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
      page = 1,
      limit = 10
    } = req.query;

    //filter object
    const filter: any = {};

    // Text search
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (type) filter.type = { $regex: type, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (amenities) filter.amenities = { $regex: amenities, $options: 'i' };
    if (furnished) filter.furnished = furnished;
    if (availableFrom) filter.availableFrom = availableFrom;
    if (listedBy) filter.listedBy = { $regex: listedBy, $options: 'i' };
    if (tags) filter.tags = { $regex: tags, $options: 'i' };
    if (colorTherm) filter.colorTherm = colorTherm;
    if (listingType) filter.listingType = listingType;

    // Numeric ranges
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

    // Build sort object
    const sort: any = {};
    if (sortBy) {
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(filter)
    ]);

    const result = {
      properties,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    };

    // Store result in cache
    await redis.setex(cacheKey, cacheTTL, JSON.stringify(result));
    console.log(`Cache SET: Properties stored in Redis cache with key ${cacheKey} for ${cacheTTL} seconds`);

    res.json(result);
  } catch (err) {
    console.error('Get properties error:', err);
    res.status(500).json({ message: 'Get properties error' });
  }
};

export const getProperty = async (req: Request, res: Response) => {
  const redis = getRedis();
  const cacheKey = `properties:single:${req.params.id}`;
  const cacheTTL = 60; // Cache for 60 seconds

  try {
    console.log('Checking Redis cache for key:', cacheKey);
    // Check cache first
    const cachedProperty = await redis.get(cacheKey);
    if (cachedProperty) {
      console.log('Cache HIT: Serving single property from Redis cache');
      return res.json(JSON.parse(cachedProperty));
    }
    console.log('Cache MISS: Single property not found in Redis cache');

    // If not in cache, fetch from DB
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Not found' });
    }

    // Store result in cache
    await redis.setex(cacheKey, cacheTTL, JSON.stringify(property));
    console.log(`Cache SET: Single property stored in Redis cache with key ${cacheKey} for ${cacheTTL} seconds`);

    res.json(property);
  } catch (err) {
    console.error('Get property error:', err);
    res.status(500).json({ message: 'Get property error' });
  }
};

export const updateProperty = async (req: any, res: Response) => {
  const redis = getRedis();
  const propertyId = req.params.id;

  try {
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Not found' });
    if (property.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    // Update property fields based on request body
    Object.assign(property, req.body);

    await property.save();

    // Invalidate cache for this single property and list views after update
    await redis.del(`properties:single:${propertyId}`);
    const cacheKeys = await redis.keys('properties:list:*');
    if (cacheKeys.length > 0) {
      await redis.del(...cacheKeys);
      console.log(`Invalidated ${cacheKeys.length} property list cache keys after update`);
    }

    res.json(property);
  } catch (err: any) {
    console.error('Update property error:', err);
    res.status(400).json({
      message: 'Update property error',
      error: err.message
    });
  }
};

export const deleteProperty = async (req: any, res: Response) => {
  const redis = getRedis();
  const propertyId = req.params.id;

  try {
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Not found' });
    if (property.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    await property.deleteOne();

    // Invalidate cache for this single property and list views after deletion
    await redis.del(`properties:single:${propertyId}`);
    const cacheKeys = await redis.keys('properties:list:*');
    if (cacheKeys.length > 0) {
      await redis.del(...cacheKeys);
      console.log(`Invalidated ${cacheKeys.length} property list cache keys after deletion`);
    }

    res.json({ message: 'Deleted' });
  } catch (err: any) {
    console.error('Delete property error:', err);
    res.status(400).json({
      message: 'Delete property error',
      error: err.message
    });
  }
}; 