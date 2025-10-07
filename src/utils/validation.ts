/**
 * Validation utilities for Elbfunkeln
 */

/**
 * UUID v4 regex pattern
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4
 * @param value - The string to validate
 * @returns true if the string is a valid UUID v4
 */
export const isValidUUID = (value: string | null | undefined): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  return UUID_REGEX.test(value);
};

/**
 * Validates if a value is a valid UUID and throws an error if not
 * @param value - The value to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if the value is not a valid UUID
 */
export const validateUUID = (value: string | null | undefined, fieldName: string): void => {
  if (!isValidUUID(value)) {
    throw new Error(`${fieldName} muss eine gültige UUID sein (erhielt: ${value})`);
  }
};

/**
 * Validates foreign key fields in product data
 * @param productData - The product data to validate
 * @throws Error if any foreign key field is invalid
 */
export const validateProductForeignKeys = (productData: {
  categoryId?: string | null;
  [key: string]: any;
}): void => {
  if (productData.categoryId) {
    validateUUID(productData.categoryId, 'categoryId');
  }
};

/**
 * Validates foreign key fields in order data
 * @param orderData - The order data to validate
 * @throws Error if any foreign key field is invalid
 */
export const validateOrderForeignKeys = (orderData: {
  userId?: string | null;
  productIds?: (string | null)[];
  [key: string]: any;
}): void => {
  if (orderData.userId) {
    validateUUID(orderData.userId, 'userId');
  }

  if (orderData.productIds && Array.isArray(orderData.productIds)) {
    orderData.productIds.forEach((id, index) => {
      if (id) {
        validateUUID(id, `productIds[${index}]`);
      }
    });
  }
};

/**
 * Validates foreign key fields in review data
 * @param reviewData - The review data to validate
 * @throws Error if any foreign key field is invalid
 */
export const validateReviewForeignKeys = (reviewData: {
  userId?: string | null;
  productId?: string | null;
  [key: string]: any;
}): void => {
  if (reviewData.userId) {
    validateUUID(reviewData.userId, 'userId');
  }

  if (reviewData.productId) {
    validateUUID(reviewData.productId, 'productId');
  }
};
