package visteon.gestionacces.IServices;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import visteon.gestionacces.Entities.Role;
import visteon.gestionacces.Entities.User;

import java.util.List;
import java.util.Optional;

public interface IUserServices {
    List<User> findAllUsers();
    Optional<User> findUserById(Long id);
    List<User> findUsersByRole(Role role);
    User updateUser(Long id, User user);
    public User assignUserToDepartment(Long userId, Long departmentId) ;
      User updateUserRole(Long userId, Role newRole) ;
     Page<User> findAll(Pageable pageable) ;

    }
