package vn.clinic.cdm.auth;

/**
 * Lá»—i Ä‘Äƒng nháº­p â€“ sai máº­t kháº©u hoáº·c khÃ´ng cÃ³ quyá»n tenant/branch.
 */
public class BadCredentialsException extends RuntimeException {

    public BadCredentialsException(String message) {
        super(message);
    }
}

