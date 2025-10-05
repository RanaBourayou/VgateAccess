package visteon.gestionacces.ServicesImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import visteon.gestionacces.Entities.Company;
import visteon.gestionacces.IServices.ICompanyServices;
import visteon.gestionacces.Repositories.CompanionRepository;
import visteon.gestionacces.Repositories.CompanyRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CompanyServiceImpl implements ICompanyServices {

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    public Company getCompany(Long id) {
        return companyRepository.findByIdCompany(id);
    }

    @Override
    public List<Company> getCompanies() {
        return companyRepository.findAll();
    }

    @Override
    public Company createCompany(Company company) {
        Optional<Company >existing = Optional.ofNullable(companyRepository.findByCompanyName(company.getCompanyName()));
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Company with name '" + company.getCompanyName() + "' already exists.");
        }
        return companyRepository.save(company);
    }


    @Override
    public Company updateCompany(Long id, Company company) {
        Company oldCompany = companyRepository.findByIdCompany(id);
        oldCompany.setCompanyName(company.getCompanyName());
        oldCompany.setCompanyAddress(company.getCompanyAddress());
        oldCompany.setCompanyPhone(company.getCompanyPhone());
        oldCompany.setCompanyEmail(company.getCompanyEmail());


        return companyRepository.save(oldCompany);
    }

    @Override
    public void deleteCompany(Long id) {
        companyRepository.deleteById(id);

    }

    @Override
    public Company getCompanyByName(String name) {
        return companyRepository.findByCompanyName(name);
    }

     @Override
    public Page<Company> findAll(Pageable pageable) {
        return companyRepository.findAll(pageable);
    }

}
