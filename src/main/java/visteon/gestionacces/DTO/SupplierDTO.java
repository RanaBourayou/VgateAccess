package visteon.gestionacces.DTO;

import lombok.Getter;
import lombok.Setter;
import visteon.gestionacces.Entities.Supplier;

@Getter
@Setter
public class SupplierDTO {
    private long idSupplier;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String companyName;

     public SupplierDTO(Supplier supplier) {
        this.idSupplier = supplier.getIdSupplier();
        this.firstName = supplier.getFirstName();
        this.lastName = supplier.getLastName();
        this.email = supplier.getEmail();
        this.phone = supplier.getPhone();
        this.companyName = supplier.getCompany() != null ? supplier.getCompany().getCompanyName() : null;
    }

 }
