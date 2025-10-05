package visteon.gestionacces.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import visteon.gestionacces.Entities.Departement;
import visteon.gestionacces.Entities.User;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Departement, Long> {

    Departement findByName(String name);
    List<User> findUsersByIdDepartement(Long departementId);
}
