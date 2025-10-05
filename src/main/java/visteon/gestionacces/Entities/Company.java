package visteon.gestionacces.Entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idCompany;
    @Column(unique = true)

    private String companyName;
    private String companyAddress;
    private String companyEmail;
    private String companyPhone;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Supplier> suppliers = new ArrayList<>();

    public Company() {
    }

    public Company(long idCompany, String companyName, String companyAddress, String companyEmail, String companyPhone, List<Supplier> suppliers) {
        this.idCompany = idCompany;
        this.companyName = companyName;
        this.companyAddress = companyAddress;
        this.companyEmail = companyEmail;
        this.companyPhone = companyPhone;
        this.suppliers = suppliers;
    }

    public long getIdCompany() {
        return idCompany;
    }

    public void setIdCompany(long idCompany) {
        this.idCompany = idCompany;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyAddress() {
        return companyAddress;
    }

    public void setCompanyAddress(String companyAddress) {
        this.companyAddress = companyAddress;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public String getCompanyPhone() {
        return companyPhone;
    }

    public void setCompanyPhone(String companyPhone) {
        this.companyPhone = companyPhone;
    }

    public List<Supplier> getSuppliers() {
        return suppliers;
    }

    public void setSuppliers(List<Supplier> suppliers) {
        this.suppliers = suppliers;
    }
}
