package visteon.gestionacces.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import visteon.gestionacces.Entities.Company;
import visteon.gestionacces.Entities.Supplier;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByCompany(Company company);
    Optional<Supplier> findByPhone(String phone);

}
