package it.unito.tweb.backendpostgres.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "recommendations")
public class Recommendations {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "mal_id", nullable = false)
    private Integer malId;

    @Column(name = "recommendation_mal_id", nullable = false)
    private Integer recommendationMalId;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getMalId() { return malId; }
    public void setMalId(Integer malId) { this.malId = malId; }

    public Integer getRecommendationMalId() { return recommendationMalId; }
    public void setRecommendationMalId(Integer recommendationMalId) { this.recommendationMalId = recommendationMalId; }
}
