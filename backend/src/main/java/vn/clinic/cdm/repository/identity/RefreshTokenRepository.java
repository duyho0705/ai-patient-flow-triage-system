package vn.clinic.cdm.repository.identity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.entity.identity.IdentityUser;
import vn.clinic.cdm.entity.identity.RefreshToken;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);

    @Modifying
    void deleteByUser(IdentityUser user);

    void deleteByToken(String token);
}
