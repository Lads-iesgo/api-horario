SELECT
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `nomeProfessor`,
  `p`.`titulacao` AS `titulacao`,
  `c`.`idCurso` AS `idCurso`,
  `c`.`codigoCurso` AS `codigoCurso`,
  `c`.`nomeCurso` AS `nomeCurso`
FROM
  (
    (
      `teste_grade_horario`.`professor` `p`
      JOIN `teste_grade_horario`.`professor_curso` `pc` ON((`p`.`idProfessor` = `pc`.`idProfessor`))
    )
    JOIN `teste_grade_horario`.`curso` `c` ON((`pc`.`idCurso` = `c`.`idCurso`))
  )
UNION
ALL
SELECT
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `nomeProfessor`,
  `p`.`titulacao` AS `titulacao`,
  `c`.`idCurso` AS `idCurso`,
  `c`.`codigoCurso` AS `codigoCurso`,
  `c`.`nomeCurso` AS `nomeCurso`
FROM
  (
    `teste_grade_horario`.`professor` `p`
    JOIN `teste_grade_horario`.`curso` `c`
  )
WHERE
  (`p`.`idProfessor` IN (9001, 9002))
ORDER BY
  `nomeCurso`,
  `nomeProfessor`