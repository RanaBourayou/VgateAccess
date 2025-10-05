package visteon.gestionacces.IServices;

import visteon.gestionacces.Entities.Departement;
import visteon.gestionacces.Entities.User;

import java.util.List;
import java.util.Optional;

public interface IDepartementService {

    List<Departement> getallDepartments();
    Optional<Departement> getDepartmentById(Long id);
    Departement createDepartment(Departement departement);
    Departement updateDepartment(Long id, Departement departement);
    void deleteDepartment(Long id);
    Departement  getDepartmentsByName(String name);
    List<User> getUsersByDepartmentId(Long departmentId);
}
