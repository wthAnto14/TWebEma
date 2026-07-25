package it.unito.tweb.backendpostgres.model.repository;

import it.unito.tweb.backendpostgres.model.entity.CharacterDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CharacterDetailsRepository extends JpaRepository<CharacterDetails, Integer> {

    List<CharacterDetails> findAllByMalIdIn(List<Integer> ids);
}
