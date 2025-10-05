package visteon.gestionacces.Entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity

public class Departement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDepartement;
    private String name;
    private String description;
    @OneToMany(mappedBy = "departement", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("departement") // optional, if you're serializing
    private List<User> users = new ArrayList<>();


    public Departement() {
    }

    public Departement(Long idDepartement, String name, String description, List<User> users) {
        this.idDepartement = idDepartement;
        this.name = name;
        this.description = description;
        this.users = users;
    }

    public Long getIdDepartement() {
        return idDepartement;
    }

    public void setIdDepartement(Long idDepartement) {
        this.idDepartement = idDepartement;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public void addUser(User user) {
        users.add(user);
        user.setDepartement(this);
    }

    public void removeUser(User user) {
        users.remove(user);
        user.setDepartement(null);
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

