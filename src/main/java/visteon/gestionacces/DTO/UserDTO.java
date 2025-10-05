package visteon.gestionacces.DTO;

import lombok.Getter;
import lombok.Setter;
import visteon.gestionacces.Entities.Role;
import visteon.gestionacces.Entities.User;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Role role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long departmentId;
    private String departmentName;
    private boolean mustChangePassword = true;


    public UserDTO(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.role = user.getRole();
        this.isActive = user.getActive();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
        this.mustChangePassword=user.isMustChangePassword();

        if (user.getDepartement() != null) {
            this.departmentId = user.getDepartement().getIdDepartement();
            this.departmentName = user.getDepartement().getName();
        }
    }

 }
