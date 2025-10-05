package visteon.gestionacces.RestController;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import visteon.gestionacces.DTO.PagedResponse;
import visteon.gestionacces.DTO.UserDTO;
import visteon.gestionacces.Entities.Role;
import visteon.gestionacces.Entities.User;
import visteon.gestionacces.IServices.IUserServices;
import visteon.gestionacces.Repositories.UserRepository;
import visteon.gestionacces.ServicesImpl.JWTTokenService;
import visteon.gestionacces.ServicesImpl.MailNotificationService;
import visteon.gestionacces.ServicesImpl.PasswordResetTokenService;
import visteon.gestionacces.ServicesImpl.UserService;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/auth")
 public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JWTTokenService jwtTokenService;
    private final PasswordResetTokenService tokenService;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private final IUserServices iuserServices;
    @Autowired
    private MailNotificationService mailNotificationService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserService userService,
                          JWTTokenService jwtTokenService, PasswordResetTokenService tokenService, UserRepository userRepository, PasswordEncoder passwordEncoder, IUserServices iuserServices) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtTokenService = jwtTokenService;
        this.tokenService = tokenService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.iuserServices = iuserServices;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = iuserServices.findAllUsers();

        List<UserDTO> userDTOs = users.stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }

    // Get user by ID
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return iuserServices.findUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        try {
            // Authenticate credentials
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            // Load user and generate JWT
            User user = userService.loadUserByUsername(email);
            String token = jwtTokenService.generateToken(user);

            // Return token and role
            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "token", token,
                    "role", user.getRole().name(),
                    "email", user.getEmail(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "mustChangePassword", user.isMustChangePassword() // <-- Add this line
            ));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
    }

    @PostMapping("/register/requester")
    public ResponseEntity<?> registerRequester(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String password = (String) payload.get("password");
        String firstName = (String) payload.get("firstName");
        String lastName = (String) payload.get("lastName");
        String phoneNumber = (String) payload.get("phoneNumber");

        Long departmentId = Long.valueOf(payload.get("departmentId").toString());

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("error", "Email already in use"));
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhoneNumber(phoneNumber);
        user.setRole(Role.REQUESTER);
        user.setMustChangePassword(true); // enforce password change on first login
        User savedUser = userRepository.save(user);
        iuserServices.assignUserToDepartment(savedUser.getId(), departmentId);

        // ✅ Send account creation email
        mailNotificationService.sendAccountCreationEmail(email, firstName, password);

        return ResponseEntity.ok(new AuthResponse(
                jwtTokenService.generateToken(savedUser),
                savedUser.isMustChangePassword()
        ));
    }

    @PostMapping("/register/receptionist")
    public ResponseEntity<?> registerReceptionist(@Valid @RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        String rawPassword = user.getPassword(); // store raw password before encoding
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.RECEPTIONIST);
        user.setMustChangePassword(true); // enforce password change

        User savedUser = userRepository.save(user);

         String fullName = user.getFirstName() + " " + user.getLastName();
        mailNotificationService.sendAccountCreationEmail(user.getEmail(), fullName, rawPassword);

        return ResponseEntity.ok(new AuthResponse(
                jwtTokenService.generateToken(savedUser),
                savedUser.isMustChangePassword()
        ));
    }


    //  LOGIN ENDPOINTS

    @PostMapping("/login/requester")
    @CrossOrigin(origins = "http://localhost:4200")
    public ResponseEntity<?> loginRequester(@RequestBody AuthRequest authRequest) {
        logger.info("Attempting to authenticate requester: {}", authRequest.getEmail());
        return handleLogin(authRequest, Role.REQUESTER);
    }

    @PostMapping("/login/receptionist")
    public ResponseEntity<?> loginReceptionist(@RequestBody AuthRequest authRequest) {
        logger.info("Attempting to authenticate receptionist: {}", authRequest.getEmail());
        return handleLogin(authRequest, Role.RECEPTIONIST);
    }

    @PostMapping("/login/admin")
    @CrossOrigin(origins = "http://localhost:4200")
    public ResponseEntity<?> loginAdmin(@RequestBody AuthRequest authRequest) {
        logger.info("Attempting to authenticate admin : {}", authRequest.getEmail());
        return handleLogin(authRequest, Role.ADMIN);
    }

    private ResponseEntity<?> handleLogin(AuthRequest authRequest, Role requiredRole) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );

            User user = userService.loadUserByUsername(authRequest.getEmail());

            // Role validation
            if (user.getRole() != requiredRole) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error",
                                "Access restricted to " + requiredRole + " role"));
            }


            return ResponseEntity.ok(new AuthResponse(
                    jwtTokenService.generateToken(user),
                    user.isMustChangePassword()
            ));

        } catch (AuthenticationException e) {
            logger.error("Authentication failed : {}", authRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Invalid credentials"));
        }
    }

    //  PASSWORD MANAGEMENT

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();
        tokenService.createPasswordResetTokenForUser(user, token);
        //emailService.sendPasswordResetEmail(user, token);

        return ResponseEntity.ok("Password reset link sent to your email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword ) {

        User user = tokenService.validatePasswordResetToken(token);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Password reset successfully");
    }

    @PostMapping("/reset-password-with-old")
    public ResponseEntity<?> resetPasswordWithOld(
            @RequestParam String email,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false); // 👈 Add this line
        userRepository.save(user);
        return ResponseEntity.ok("Password reset successfully");
    }

    //  GET CURRENT USER
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtTokenService.extractUsername(token);
        User user = userService.loadUserByUsername(email);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "role", user.getRole()
        ));
    }


    @PutMapping("/{userId}/assign-department/{departmentId}")
    public ResponseEntity<?> assignDepartmentToUser(@PathVariable Long userId, @PathVariable Long departmentId) {
        try {
            User updatedUser = iuserServices.assignUserToDepartment(userId, departmentId);
            return ResponseEntity.ok(updatedUser);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            User user = iuserServices.updateUser(id, updatedUser);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().body("User deleted successfully");
    }


    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Old password is incorrect"));
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "New password cannot be the same as the old password"));
        }

        if (!isValidPassword(newPassword)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Password must be at least 8 characters long and include at least one special character"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("text", "Password changed successfully"));
    }

    private boolean isValidPassword(String password) {
        // Ensure password is at least 8 characters long and contains at least one special character
        return password.length() >= 8 && password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    public ResponseEntity<User> updateRole(@PathVariable Long id, @RequestParam Role role) {
        User updatedUser = iuserServices.updateUserRole(id, role);
        return ResponseEntity.ok(updatedUser);
    }
    @Getter
    public static class AuthRequest {
        private String email;
        private String password;
    }

    @Data
    @Builder
    public static class AuthResponse {
        private String token;
        private boolean mustChangePassword;

        public AuthResponse(String token, boolean mustChangePassword) {
            this.token = token;
            this.mustChangePassword = mustChangePassword;
        }    }


    @GetMapping("/paginated")
    public PagedResponse<User> getUsers(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = iuserServices.findAll(pageable);
        return new PagedResponse<>(
                userPage.getContent(),
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages()
        );
    }

}



