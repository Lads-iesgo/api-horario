SELECT
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `nomeProfessor`,
  `pc`.`isCoordenador` AS `isCoordenador`,
  `c`.`idCurso` AS `idCurso`,
  `c`.`nomeCurso` AS `nomeCurso`
FROM
  (
    (
      `teste_grade_horario`.`professor` `p`
      JOIN `teste_grade_horario`.`professor_curso` `pc` ON((`p`.`idProfessor` = `pc`.`idProfessor`))
    )
    JOIN `teste_grade_horario`.`curso` `c` ON((`pc`.`idCurso` = `c`.`idCurso`))
  )
WHERE
  (`pc`.`isCoordenador` = 1)