package visteon.gestionacces.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Companion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCompanion;
    @JsonProperty("firstName")
    private String firstNamecompanion;

    @JsonProperty("lastName") // Match Angular field name
    private String lastNamecompanion;

    @Column(unique = true, nullable = false)
    private String email;
    private int phoneNumber;
    private String companyName;
    @Column(nullable = false)
    private LocalDateTime Arrival;

    @Column(nullable = false)
    private LocalDateTime Departure;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_request_id")
    @JsonBackReference("guest-visitrequest")
    private VisitRequest visitRequest;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "visitor_id_visitor", nullable = false)
    @JsonBackReference("guest-visitor")
    private Visitor visitor;

    public Companion() {
    }


    public Companion(Visitor visitor, VisitRequest visitRequest, LocalDateTime departure, LocalDateTime arrival, String companyName, int phoneNumber, String email, String lastNamecompanion, String firstNamecompanion, Long idCompanion) {
        this.visitor = visitor;
        this.visitRequest = visitRequest;
        Departure = departure;
        Arrival = arrival;
        this.companyName = companyName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.lastNamecompanion = lastNamecompanion;
        this.firstNamecompanion = firstNamecompanion;
        this.idCompanion = idCompanion;
    }

    public Visitor getVisitor() {
        return visitor;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public void setVisitor(Visitor visitor) {
        this.visitor = visitor;
        if (visitor != null && !visitor.getGuestList().contains(this)) {
            visitor.getGuestList().add(this);
        }
    }


    public Long getIdCompanion() {
        return idCompanion;
    }

    public void setIdCompanion(Long idGuest) {
        this.idCompanion = idGuest;
    }


    public String getFirstName() {
        return firstNamecompanion;
    }

    public void setFirstName(String firstName) {
        this.firstNamecompanion = firstName;
    }

    public String getLastName() {
        return lastNamecompanion;
    }

    public void setLastName(String lastName) {
        this.lastNamecompanion = lastName;
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

    public VisitRequest getVisitRequest() {
        return visitRequest;
    }

    public void setVisitRequest(VisitRequest visitRequest) {
        this.visitRequest = visitRequest;
    }

    public LocalDateTime getArrival() {
        return Arrival;
    }

    public void setArrival(LocalDateTime arrival) {
        Arrival = arrival;
    }

    public LocalDateTime getDeparture() {
        return Departure;
    }

    public void setDeparture(LocalDateTime departure) {
        Departure = departure;
    }
}
