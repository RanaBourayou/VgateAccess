package visteon.gestionacces.RestController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import visteon.gestionacces.DTO.PagedResponse;
import visteon.gestionacces.Entities.Company;
import visteon.gestionacces.IServices.ICompanyServices;

import java.util.List;

@RestController
@RequestMapping("/api/company")
@CrossOrigin(origins = "http://localhost:4200")

public class CompanyRestController {

    @Autowired
    private ICompanyServices companyService;

    // Get all companies
    @GetMapping
    public List<Company> getAllCompanies() {
        return companyService.getCompanies();
    }

    // Get company by ID
    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        Company company = companyService.getCompany(id);
        if (company == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(company);
    }

    // Create new company
    @PostMapping
    public Company createCompany(@RequestBody Company company) {
        return companyService.createCompany(company);
    }

    // Update company by ID
    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @RequestBody Company company) {
        Company existingCompany = companyService.getCompany(id);
        if (existingCompany == null) {
            return ResponseEntity.notFound().build();
        }
        Company updatedCompany = companyService.updateCompany(id, company);
        return ResponseEntity.ok(updatedCompany);
    }

    // Delete company by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        Company existingCompany = companyService.getCompany(id);
        if (existingCompany == null) {
            return ResponseEntity.notFound().build();
        }
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    // Get company by name
    @GetMapping("/name/{name}")
    public ResponseEntity<Company> getCompanyByName(@PathVariable String name) {
        Company company = companyService.getCompanyByName(name);
        if (company == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(company);
    }

    @GetMapping("/paginated")
    public PagedResponse<Company> getCompaniesPaged(@RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Company> companyPage = companyService.findAll(pageable);
        return new PagedResponse<>(
                companyPage.getContent(),
                companyPage.getNumber(),
                companyPage.getSize(),
                companyPage.getTotalElements(),
                companyPage.getTotalPages()
        );
    }
}
