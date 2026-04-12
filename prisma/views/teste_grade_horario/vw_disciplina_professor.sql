SELECT
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `nomeProfessor`,
  `d`.`idDisciplina` AS `idDisciplina`,
  `d`.`nomeDisciplina` AS `nomeDisciplina`
FROM
  (
    (
      `teste_grade_horario`.`professor` `p`
      JOIN `teste_grade_horario`.`disciplina_professor` `dp` ON((`p`.`idProfessor` = `dp`.`idProfessor`))
    )
    JOIN `teste_grade_horario`.`disciplina` `d` ON((`dp`.`idDisciplina` = `d`.`idDisciplina`))
  )