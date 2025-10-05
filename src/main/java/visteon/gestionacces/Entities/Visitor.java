package visteon.gestionacces.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity

public class Visitor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idVisitor;
    private String firstName;
    private String lastName;
    @Column(unique = true, nullable = false)
    private String email;
    private int phoneNumber;
    private String companyName;
    @Column(unique = true)
    private Integer cin;

    @OneToMany(mappedBy = "visitor", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private List<VisitRequest> visitRequests = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private VisitorType visitorType;

    @OneToMany(mappedBy = "visitor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("guest-visitor")
    private List<Companion> guestList = new ArrayList<>();

    public Visitor() {

    }

    public Visitor(Long idVisitor, String firstName, String lastName, String email, int phoneNumber, String companyName, Integer cin, List<VisitRequest> visitRequests, VisitorType visitorType, List<Companion> guestList) {
        this.idVisitor = idVisitor;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.companyName = companyName;
        this.cin = cin;
        this.visitRequests = visitRequests;
        this.visitorType = visitorType;
        this.guestList = guestList;
    }

    public Integer getCin() {
        return cin;
    }

    public void setCin(Integer cin) {
        this.cin = cin;
    }

    public List<VisitRequest> getVisitRequests() {
        return visitRequests;
    }

    public void setVisitRequests(List<VisitRequest> visitRequests) {
        this.visitRequests = visitRequests;
    }



    public Long getIdVisitor() {
        return idVisitor;
    }

    public void setIdVisitor(Long idVisitor) {
        this.idVisitor = idVisitor;
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

    public int getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(int phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }




    public VisitorType getVisitorType() {
        return visitorType;
    }

    public void setVisitorType(VisitorType visitorType) {
        this.visitorType = visitorType;
    }

    public List<Companion> getGuestList() {
        return guestList;
    }

    public void setGuestList(List<Companion> guestList) {
        this.guestList = guestList;
    }

    public void addCompanion(Companion companion) {
        guestList.add(companion);
        companion.setVisitor(this);
    }

    public void removeCompanion(Companion companion) {
        guestList.remove(companion);
        companion.setVisitor(null);
    }

}

