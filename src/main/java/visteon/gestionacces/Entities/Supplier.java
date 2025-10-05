package visteon.gestionacces.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  long idSupplier;
    private String firstName;
    private String lastName;
    private String email;
    @Column(unique = true)

    private String phone;
    @ManyToOne
    @JoinColumn(name = "company_id")
    @JsonBackReference
    private Company company;


    public Supplier() {
    }

    public Supplier(long idSupplier, String firstName, String lastName, String email, String phone, Company company) {
        this.idSupplier = idSupplier;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.company = company;
    }

    public long getIdSupplier() {
        return idSupplier;
    }

    public void setIdSupplier(long idSupplier) {
        this.idSupplier = idSupplier;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }
}
