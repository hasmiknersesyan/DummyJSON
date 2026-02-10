import Ajv from "ajv";
import addFormats from "ajv-formats"; // Correct import for formats

// Initialize Ajv validator once (singleton pattern)
const ajv = new Ajv({
    allErrors: true, // show all validation errors
    strict: true, // enable strict schema validation
    coerceTypes: false // DO NOT convert types (very important!)
});
addFormats(ajv);

/**
 * Validates API response against JSON schema
 * @param response - API response data to validate
 * @param schema - JSON schema to validate against
 * @throws {Error} - Throws detailed error when validation fails
 */
export const validateResponseSchema = (response: any, schema: object): boolean => {
    const validate = ajv.compile(schema);
    const isValid = validate(response);
  
    if (!isValid && validate.errors) {
        const errorMessages = validate.errors.map((error: any) => 
            `Path: ${error.instancePath || 'root'} - ${error.message}`
        ).join('\n');
        
        // Include actual response in error for debugging
        throw new Error(
            `Schema validation failed:\n${errorMessages}\n\nActual Response:\n${JSON.stringify(response, null, 2)}`
        );
    }
    
    return isValid; 
};