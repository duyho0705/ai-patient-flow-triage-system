package vn.clinic.cdm.common.exception;

import java.util.UUID;

/**
 * Thrown when a resource (entity) is not found for the given identifier.
 * Mapped to 404 by {@link GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {

    private final String resourceName;
    private final String identifier;

    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(String.format("%s not found: %s", resourceName, identifier));
        this.resourceName = resourceName;
        this.identifier = identifier != null ? identifier.toString() : null;
    }

    public ResourceNotFoundException(String resourceName, UUID id) {
        this(resourceName, id != null ? id.toString() : null);
    }

    public ResourceNotFoundException(String message) {
        super(message);
        this.resourceName = "Resource";
        this.identifier = null;
    }

    public String getResourceName() {
        return resourceName;
    }

    public String getIdentifier() {
        return identifier;
    }
}

