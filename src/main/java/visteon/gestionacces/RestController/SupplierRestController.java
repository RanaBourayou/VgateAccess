package visteon.gestionacces.RestController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import visteon.gestionacces.DTO.PagedResponse;
import visteon.gestionacces.DTO.SupplierDTO;
import visteon.gestionacces.Entities.Company;
import visteon.gestionacces.Entities.Supplier;
import visteon.gestionacces.IServices.ISupplierServices;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import visteon.gestionacces.DTO.PagedResponse;
import java.util.List;

@RestController
@RequestMapping("/api/supplier")
@CrossOrigin(origins = "http://localhost:4200")

public class SupplierRestController {

    @Autowired
    private ISupplierServices supplierService;

     @GetMapping
    public List<SupplierDTO> getAllSuppliers() {
        List<Supplier> suppliers = supplierService.findAllSuppliers();
        return suppliers.stream()
                .map(SupplierDTO::new)
                .toList();
    }


    // Get supplier by id
    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable Long id) {
        Supplier supplier = supplierService.findByIdSupplier(id);
        if (supplier == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(supplier);
    }

    // Create new supplier
    @PostMapping
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        return supplierService.createSupplier(supplier);
    }

    // Update supplier by id
    @PutMapping("/{id}")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable Long id, @RequestBody Supplier supplier) {
        try {
            Supplier updatedSupplier = supplierService.updateSupplier(id, supplier);
            return ResponseEntity.ok(updatedSupplier);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete supplier by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        try {
            Supplier supplier = supplierService.findByIdSupplier(id);
            supplierService.deleteSupplier(supplier);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Assign supplier to a company
    @PostMapping("/{supplierId}/assign-company/{companyId}")
    public ResponseEntity<Supplier> assignSupplierToCompany(
            @PathVariable Long supplierId,
            @PathVariable Long companyId) {

        try {
            Supplier supplier = supplierService.findByIdSupplier(supplierId);
            Company company = new Company();
            company.setIdCompany(companyId);
            Supplier updatedSupplier = supplierService.affectSupplierToCompany(supplier, company);
            return ResponseEntity.ok(updatedSupplier);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

     @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Supplier>> getSuppliersByCompany(@PathVariable Long companyId) {
        try {
            Company company = new Company();
            company.setIdCompany(companyId);
            List<Supplier> suppliers = supplierService.findByCompany(company);
            return ResponseEntity.ok(suppliers);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/paginated")
    public PagedResponse<SupplierDTO> getSuppliersPaged(@RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Supplier> supplierPage = supplierService.findAll(pageable);

        List<SupplierDTO> supplierDTOs = supplierPage.getContent().stream()
                .map(SupplierDTO::new)
                .toList();

        return new PagedResponse<>(
                supplierDTOs,
                supplierPage.getNumber(),
                supplierPage.getSize(),
                supplierPage.getTotalElements(),
                supplierPage.getTotalPages()
        );
    }

}
