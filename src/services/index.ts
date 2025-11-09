/**
 * Services Index
 * Export all API services from a single entry point
 */

export { default as emailService } from './emailService';
export type { Email, Attachment, ParseEmailRequest, ParseEmailResponse } from './emailService';

export { default as bookingService } from './bookingService';
export type * from './bookingService';

export { default as crewService } from './crewService';

export { default as propertyService } from './propertyService';
export type * from './propertyService';
