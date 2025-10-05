package visteon.gestionacces.ServicesImpl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import visteon.gestionacces.Entities.Departement;
import visteon.gestionacces.Entities.Role;
import visteon.gestionacces.Entities.User;
import visteon.gestionacces.Repositories.DepartmentRepository;
import visteon.gestionacces.Repositories.UserRepository;
import visteon.gestionacces.IServices.IUserServices;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@AllArgsConstructor
public class UserServiceImpl implements IUserServices {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<User> findUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }



    @Override
    public User updateUser(Long id, User updatedUser) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User with ID " + id + " not found");
        }
        return userRepository.save(updatedUser);
    }

    @Override
    @Transactional
    public User assignUserToDepartment(Long userId, Long departmentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        Departement department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new EntityNotFoundException("Department not found with ID: " + departmentId));

        user.setDepartement(department);
        return userRepository.save(user);
    }

    @Override
    public User updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
    @Override
    public Page<User> findAll(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

}
