package visteon.gestionacces.Entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class VisitRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idVisitRequest;

    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime visitDate;

    @Column(nullable = false)
    private LocalDateTime expectedArrival;

    @Column(nullable = false)
    private LocalDateTime expectedDeparture;

    private String visitPurpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitRequestStatus visitRequestStatus;
    @Column(nullable = false , name = "pin_code")
    private int  pinCode;
    @ManyToOne
    private User requester;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "visitor_id_visitor", nullable = true)
    private Visitor visitor;

    private String personneConcernee;

    @OneToMany(mappedBy = "visitRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("guest-visitrequest")
    private List<Companion> additionalGuests = new ArrayList<>();

   @Version
    private Integer version;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime Departure;

    private boolean admin_approval= false;

    public VisitRequest() {

    }


    public VisitRequest(Long idVisitRequest, LocalDateTime visitDate, LocalDateTime expectedArrival, LocalDateTime expectedDeparture, String visitPurpose, VisitRequestStatus visitRequestStatus, int pinCode, User requester, Visitor visitor, String personneConcernee, List<Companion> additionalGuests, Integer version, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime departure, boolean admin_approval) {
        this.idVisitRequest = idVisitRequest;
        this.visitDate = visitDate;
        this.expectedArrival = expectedArrival;
        this.expectedDeparture = expectedDeparture;
        this.visitPurpose = visitPurpose;
        this.visitRequestStatus = visitRequestStatus;
        this.pinCode = pinCode;
        this.requester = requester;
        this.visitor = visitor;
        this.personneConcernee = personneConcernee;
        this.additionalGuests = additionalGuests;
        this.version = version;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        Departure = departure;
        this.admin_approval = admin_approval;
    }

    public boolean isAdmin_approval() {
        return admin_approval;
    }

    public void setAdmin_approval(boolean admin_approval) {
        this.admin_approval = admin_approval;
    }

    public int getPinCode() {
        return pinCode;
    }

    public void setPinCode(int pinCode) {
        this.pinCode = pinCode;
    }

    public Long getIdVisitRequest() {
        return idVisitRequest;
    }

    public void setIdVisitRequest(Long idVisitRequest) {
        this.idVisitRequest = idVisitRequest;
    }



    public String getVisitPurpose() {
        return visitPurpose;
    }

    public void setVisitPurpose(String visitPurpose) {
        this.visitPurpose = visitPurpose;
    }

    public VisitRequestStatus getVisitRequestStatus() {
        return visitRequestStatus;
    }

    public void setVisitRequestStatus(VisitRequestStatus visitRequestStatus) {
        this.visitRequestStatus = visitRequestStatus;
    }

    public User getRequester() {
        return requester;
    }

    public void setRequester(User requester) {
        this.requester = requester;
    }

    public Visitor getVisitor() {
        return visitor;
    }

    public void setVisitor(Visitor visitor) {
        this.visitor = visitor;
    }

    public String getPersonneConcernee() {
        return personneConcernee;
    }

    public void setPersonneConcernee(String personneConcernee) {
        this.personneConcernee = personneConcernee;
    }

    public LocalDateTime getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDateTime visitDate) {
        this.visitDate = visitDate;
    }

    public LocalDateTime getExpectedArrival() {
        return expectedArrival;
    }

    public void setExpectedArrival(LocalDateTime expectedArrival) {
        this.expectedArrival = expectedArrival;
    }

    public LocalDateTime getExpectedDeparture() {
        return expectedDeparture;
    }

    public void setExpectedDeparture(LocalDateTime expectedDeparture) {
        this.expectedDeparture = expectedDeparture;
    }

    public List<Companion> getAdditionalGuests() {
        return additionalGuests;
    }

    public void setAdditionalGuests(List<Companion> guests) {
        this.additionalGuests.clear(); // Clear old ones

        if (guests != null) {
            for (Companion g : guests) {
                g.setVisitRequest(this); // important
                this.additionalGuests.add(g);
            }
        }
    }

    // Add these new methods for safe collection management:
    public void addAdditionalGuest(Companion guest) {
        additionalGuests.add(guest);
        guest.setVisitRequest(this);
    }

    public void removeAdditionalGuest(Companion guest) {
        additionalGuests.remove(guest);
        guest.setVisitRequest(null);
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDeparture() {
        return Departure;
    }

    public void setDeparture(LocalDateTime departure) {
        Departure = departure;
    }
}
