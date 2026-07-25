package it.unito.tweb.backendpostgres.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "character_anime_works")
@IdClass(CharacterAnimeWorksId.class)
public class CharacterAnimeWorks {

    @Id
    @Column(name = "anime_mal_id")
    private Integer animeMalId;

    @Id
    @Column(name = "character_mal_id")
    private Integer characterMalId;

    @Id
    @Column(name = "role")
    private String role;

    @Column(name = "character_name")
    private String characterName;

    public Integer getAnimeMalId() { return animeMalId; }
    public Integer getCharacterMalId() { return characterMalId; }
    public String getRole() { return role; }
    public String getCharacterName() { return characterName; }
}
