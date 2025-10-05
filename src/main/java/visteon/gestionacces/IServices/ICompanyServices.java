package visteon.gestionacces.IServices;

import visteon.gestionacces.Entities.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ICompanyServices {
    Company getCompany(Long id);
    List<Company> getCompanies();
    Company createCompany(Company company);
    Company updateCompany(Long id, Company company);
    void deleteCompany(Long id);
    Company getCompanyByName(String name);
    Page<Company> findAll(Pageable pageable);
}
