package visteon.gestionacces.IServices;

import visteon.gestionacces.Entities.Company;
import visteon.gestionacces.Entities.Supplier;
 import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ISupplierServices {
    Supplier findByIdSupplier(Long id);
    List<Supplier> findByCompany(Company company);
    Supplier createSupplier(Supplier supplier);
    Supplier updateSupplier(long id, Supplier supplier);
    void deleteSupplier(Supplier supplier);
    List<Supplier> findAllSuppliers();
    Supplier affectSupplierToCompany(Supplier supplier, Company company);
    Page<Supplier> findAll(Pageable pageable);

}
