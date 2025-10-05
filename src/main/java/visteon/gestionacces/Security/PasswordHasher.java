package visteon.gestionacces.Security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHasher {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("Admin: " + encoder.encode("admin"));
        System.out.println("Receptionist: " + encoder.encode("ghada"));
        System.out.println("Requester: " + encoder.encode("request"));
    }
}
