package visteon.gestionacces.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import visteon.gestionacces.Entities.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Company findByIdCompany(Long id);
    Company findByCompanyName(String name);

}
