package visteon.gestionacces.ServicesImpl;

import org.springframework.stereotype.Service;
import visteon.gestionacces.Entities.Departement;
import visteon.gestionacces.Entities.User;
import visteon.gestionacces.IServices.IDepartementService;
import visteon.gestionacces.Repositories.DepartmentRepository;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentServiceImpl implements IDepartementService {
    private final DepartmentRepository departmentRepository;
    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public List<Departement> getallDepartments() {
        return departmentRepository.findAll();
    }

    @Override
    public Optional<Departement> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    @Override
    public Departement createDepartment(Departement departement) {
        return  departmentRepository.save(departement);
    }

    @Override
    public Departement updateDepartment(Long id, Departement departement) {
        Departement existingDepartment = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found with ID: " + id));
        return departmentRepository.save(departement);
    }

    @Override
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new IllegalArgumentException("Department not found with ID: " + id);
        }
        departmentRepository.deleteById(id);

    }

    @Override
    public  Departement getDepartmentsByName(String name) {
        return departmentRepository.findByName(name);
    }

    @Override
    public List<User> getUsersByDepartmentId(Long departmentId) {
        return  departmentRepository.findUsersByIdDepartement(departmentId);
    }
}
