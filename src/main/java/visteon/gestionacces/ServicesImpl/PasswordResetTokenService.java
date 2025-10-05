package visteon.gestionacces.ServicesImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import visteon.gestionacces.Entities.User;
import visteon.gestionacces.Repositories.UserRepository;

import java.time.LocalDateTime;

@Service
public class PasswordResetTokenService {

    @Autowired
    private UserRepository userRepository;

    @Value("30")
    private int tokenExpiryMinutes;

    public void createPasswordResetTokenForUser(User user, String token) {
        user.setPasswordResetToken(token);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(tokenExpiryMinutes));
        userRepository.save(user);
    }

    public User validatePasswordResetToken(String token) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        return user;
    }
}
