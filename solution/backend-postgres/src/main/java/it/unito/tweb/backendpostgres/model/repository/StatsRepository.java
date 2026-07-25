package it.unito.tweb.backendpostgres.model.repository;

import it.unito.tweb.backendpostgres.model.entity.Stats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StatsRepository extends JpaRepository<Stats, Integer> {
}
