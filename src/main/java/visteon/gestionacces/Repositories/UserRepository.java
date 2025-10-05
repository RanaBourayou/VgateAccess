package visteon.gestionacces.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import visteon.gestionacces.Entities.Role;
import visteon.gestionacces.Entities.User;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User>findByEmail(String email);
    List<User> findByRole(Role role);
    Optional<User> findByPasswordResetToken(String token);
    boolean existsByEmail(String email);
    Page<User> findAll(Pageable pageable);
}
