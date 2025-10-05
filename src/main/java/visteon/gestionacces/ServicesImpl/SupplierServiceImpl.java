package visteon.gestionacces.ServicesImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import visteon.gestionacces.Entities.Company;
import visteon.gestionacces.Entities.Supplier;
import visteon.gestionacces.IServices.ISupplierServices;
import visteon.gestionacces.Repositories.CompanyRepository;
import visteon.gestionacces.Repositories.SupplierRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SupplierServiceImpl implements ISupplierServices {
    @Autowired
    private SupplierRepository supplierRepository;
    @Autowired
    private CompanyRepository companyRepository;
    @Override
    public Supplier findByIdSupplier(Long id) {
        return supplierRepository.findById(id).get();
    }

    @Override
    public List<Supplier> findByCompany(Company company) {
        return supplierRepository.findByCompany(company);
    }

    @Override
    public Supplier createSupplier(Supplier supplier) {
        Optional<Supplier> existing = supplierRepository.findByPhone(supplier.getPhone());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("A supplier with phone number '" + supplier.getPhone() + "' already exists.");
        }
        return supplierRepository.save(supplier);
    }


    @Override
    public Supplier updateSupplier(long id, Supplier newSupplier) {
        Supplier oldSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));

        oldSupplier.setFirstName(newSupplier.getFirstName());
        oldSupplier.setLastName(newSupplier.getLastName());
        oldSupplier.setEmail(newSupplier.getEmail());
        oldSupplier.setPhone(newSupplier.getPhone());
        oldSupplier.setCompany(newSupplier.getCompany());

        return supplierRepository.save(oldSupplier);
    }


    @Override
    public void deleteSupplier(Supplier supplier) {
        supplierRepository.delete(supplier);

    }

    @Override
    public List<Supplier> findAllSuppliers() {
        return supplierRepository.findAll();
    }

    @Override
    public Supplier affectSupplierToCompany(Supplier supplier, Company company) {
         Supplier existingSupplier = supplierRepository.findById(supplier.getIdSupplier())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

         Company existingCompany = companyRepository.findById(company.getIdCompany())
                .orElseThrow(() -> new RuntimeException("Company not found"));

         existingSupplier.setCompany(existingCompany);

         return supplierRepository.save(existingSupplier);
    }
    @Override
    public Page<Supplier> findAll(Pageable pageable) {
        return supplierRepository.findAll(pageable);
    }
}
