package visteon.gestionacces.RestController;

import org.springframework.web.bind.annotation.*;
import visteon.gestionacces.Entities.Departement;
import visteon.gestionacces.IServices.IDepartementService;
import visteon.gestionacces.Repositories.UserRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/departments")
@CrossOrigin(origins = "http://localhost:4200")
public class DepartmentRestController {

    private final IDepartementService departementService;
    private final UserRepository userRepository;
    public DepartmentRestController(IDepartementService departementService, UserRepository userRepository) {
        this.departementService = departementService;
        this.userRepository = userRepository;
    }

    @GetMapping("getALl")
    public List<Departement> getDepartments() {
        return departementService.getallDepartments();
    }

    @GetMapping("getById")
    public Optional<Departement> getDepartmentById(Long id) {
        return departementService.getDepartmentById(id);
    }

    @PostMapping("addDepartment")
    public Departement addDepartment(@RequestBody Departement departement) {
        return departementService.createDepartment(departement);
    }



    @PostMapping("updateDepartment/{id}")
    public Departement updateDepartment(@PathVariable  Long id,@RequestBody Departement departement) {
        return departementService.updateDepartment(id, departement);
    }

    @PostMapping("deleteDepartment")
    public void deleteDepartment(Long id) {
        departementService.deleteDepartment(id);
    }

}
